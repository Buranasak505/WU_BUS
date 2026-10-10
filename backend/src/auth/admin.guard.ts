import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const header: string = req.headers['authorization'] ?? '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) throw new UnauthorizedException('กรุณาเข้าสู่ระบบ');

    try {
      const payload = await this.jwt.verifyAsync(token);
      if (payload.role !== 'ADMIN') throw new ForbiddenException('ต้องเป็นผู้ดูแลระบบ');
      req.user = payload;
      return true;
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new UnauthorizedException('token ไม่ถูกต้องหรือหมดอายุ');
    }
  }
}
