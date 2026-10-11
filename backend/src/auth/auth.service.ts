import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');

    let isMatch = false;

    // ลองเช็คแบบ Plain Text ดูก่อน
    if (password === user.password) {
      isMatch = true;
    } else {
      // ถ้าไม่ตรง ลองเช็คแบบ bcrypt เผื่อฐานข้อมูลถูกแฮชไว้
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch (e) {
        isMatch = false;
      }
    }

    if (!isMatch) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }

    const token = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { token, role: user.role, username: user.username };
  }
}