import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Un compte avec cet email existe déjà');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user and business in a transaction
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                business: {
                    create: {
                        name: dto.businessName,
                        phone: dto.phone,
                        address: dto.address,
                        city: dto.city,
                        country: dto.country || 'FR',
                        siret: dto.siret,
                    },
                },
            },
            include: {
                business: true,
            },
        });

        // Generate JWT
        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                business: user.business,
            },
            accessToken: token,
        };
    }

    async login(dto: LoginDto) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { business: true },
        });

        if (!user) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Email ou mot de passe incorrect');
        }

        // Generate JWT
        const token = this.generateToken(user.id, user.email, user.role);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                business: user.business,
            },
            accessToken: token,
        };
    }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { business: true },
        });

        if (!user) {
            throw new UnauthorizedException('Utilisateur non trouvé');
        }

        const { password, ...result } = user;
        return result;
    }

    private generateToken(userId: string, email: string, role: string): string {
        return this.jwtService.sign({
            sub: userId,
            email,
            role,
        });
    }
}
