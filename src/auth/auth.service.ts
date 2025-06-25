import { ForbiddenException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { AuthDto } from './dto'
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library'

@Injectable({})
export class AuthService {
    constructor(private prisma: PrismaService) {}

    // Signup method used to create a new user in the system
    async signup(dto: AuthDto) {
        try {
            // eslint-disable-next-line no-console
            const hashedPassword = await argon.hash(dto.password)

            // create user
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword
                }
            })

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...data } = user

            return data
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('This user is already exists.')
                }
            }
            throw error
        }
    }

    // Sign method used to verify user creadentials and return user data
    async signin(dto: AuthDto) {
        // Find user in the system
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        // Return exception if user not found
        if (!user) {
            throw new ForbiddenException('USer not exists.')
        }

        // Check if password is correct by comparing both
        const isPasswordMatch = await argon.verify(user.password, dto.password)

        // If password is not match, throw exception
        if (!isPasswordMatch) {
            throw new ForbiddenException('Invalid creadentials.')
        }

        // Remove password from user object
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...data } = user
        return data
    }
}
