import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: any) {
    // Note: Nanti kita bisa tambahkan DTO (Data Transfer Object) untuk validasi input
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}