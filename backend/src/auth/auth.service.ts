import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(name: string, email: string, pass: string) {
    // 1. Cek apakah email sudah terdaftar
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('Email sudah digunakan!');
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(pass, 10);

    // 3. Simpan ke database
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 4. Jangan kembalikan password di response
    const { password, ...result } = user;
    return result;
  }

  async login(email: string, pass: string) {
    // 1. Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // 2. Cocokkan password
    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }

    // 3. Buat JWT Token
    const payload = { sub: user.id, email: user.email, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
