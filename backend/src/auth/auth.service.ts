import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

    // เช็ครหัสผ่านแบบข้อความธรรมดา ตัดปัญหาเรื่อง bcrypt หลุดโฟกัส
    if (password !== user.password) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { token, role: user.role, username: user.username };
  }
}