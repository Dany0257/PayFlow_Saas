import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    async create(@Request() req: any, @Body() dto: CreateClientDto) {
        return this.clientsService.create(req.user.id, dto);
    }

    @Get()
    async findAll(@Request() req: any) {
        return this.clientsService.findAll(req.user.id);
    }

    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.clientsService.findOne(req.user.id, id);
    }

    @Patch(':id')
    async update(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateClientDto,
    ) {
        return this.clientsService.update(req.user.id, id, dto);
    }

    @Delete(':id')
    async delete(@Request() req: any, @Param('id') id: string) {
        return this.clientsService.delete(req.user.id, id);
    }
}
