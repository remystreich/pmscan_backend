import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PmscanService } from './pmscan.service';
import { CreatePmscanDto } from './dto/create-pmscan.dto';
import { UpdatePmscanDto } from './dto/update-pmscan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Pmscan')
@Controller('pmscan')
export class PmscanController {
  constructor(private readonly pmscanService: PmscanService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a pmscan' })
  @ApiResponse({ status: 200, description: 'Pmscan created' })
  @ApiResponse({ status: 404, description: 'User not found' })
  create(@Body() createPmscanDto: CreatePmscanDto, @CurrentUser() user: User) {
    return this.pmscanService.create(createPmscanDto, user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all pmscans from current user' })
  @ApiResponse({ status: 200, description: 'Pmscans found' })
  @ApiResponse({ status: 404, description: 'No pmscans found' })
  findAllFromUser(@CurrentUser() user: User) {
    return this.pmscanService.findAllFromUser(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a pmscan by id' })
  @ApiResponse({ status: 200, description: 'Pmscan found' })
  @ApiResponse({ status: 404, description: 'Pmscan not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this PMScan',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pmscanService.findOne(+id, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a pmscan by id' })
  @ApiResponse({ status: 200, description: 'Pmscan updated' })
  @ApiResponse({ status: 404, description: 'Pmscan not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this PMScan',
  })
  update(
    @Param('id') id: string,
    @Body() updatePmscanDto: UpdatePmscanDto,
    @CurrentUser() user: User,
  ) {
    return this.pmscanService.update(+id, updatePmscanDto, user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a pmscan by id' })
  @ApiResponse({ status: 200, description: 'Pmscan deleted' })
  @ApiResponse({ status: 404, description: 'Pmscan not found' })
  @ApiResponse({
    status: 403,
    description: 'You are not allowed to access this PMScan',
  })
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.pmscanService.remove(+id, user.id);
  }
}
