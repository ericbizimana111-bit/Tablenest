import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Table, TableDocument, TableStatus } from './table.schema';

@Injectable()
export class TablesService {
    constructor(@InjectModel(Table.name) private tableModel: Model<TableDocument>) { }

    async findByRestaurant(restaurantId: string) {
        return this.tableModel.find({ restaurantId }).sort({ tableNumber: 1 });
    }

    async create(restaurantId: string, data: any) {
        return this.tableModel.create({ ...data, restaurantId });
    }

    async update(id: string, data: any) {
        return this.tableModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    }

    async updateStatus(id: string, status: TableStatus, guestId?: string) {
        const update: any = { status };
        if (guestId) { update.currentGuestId = guestId; update.seatedAt = new Date(); }
        if (status === TableStatus.AVAILABLE) { update.currentGuestId = null; update.seatedAt = null; update.serverNotes = null; }
        return this.tableModel.findByIdAndUpdate(id, update, { new: true });
    }

    async delete(id: string) {
        await this.tableModel.findByIdAndDelete(id);
        return { message: 'Table deleted' };
    }

    async getFloorPlan(restaurantId: string) {
        const tables = await this.tableModel.find({ restaurantId });
        const stats = {
            total: tables.length,
            available: tables.filter(t => t.status === TableStatus.AVAILABLE).length,
            occupied: tables.filter(t => t.status === TableStatus.OCCUPIED).length,
            reserved: tables.filter(t => t.status === TableStatus.RESERVED).length,
        };
        return { tables, stats };
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / tables / tables.controller.ts << 'EOF'
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TablesService } from './tables.service';
import { TableStatus } from './table.schema';

@Controller('tables')
@UseGuards(AuthGuard('jwt'))
export class TablesController {
    constructor(private tablesService: TablesService) { }

    @Get('restaurant/:restaurantId')
    findByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.tablesService.findByRestaurant(restaurantId);
    }

    @Get('floor-plan/:restaurantId')
    getFloorPlan(@Param('restaurantId') restaurantId: string) {
        return this.tablesService.getFloorPlan(restaurantId);
    }

    @Post()
    create(@Body() data: any) {
        return this.tablesService.create(data.restaurantId, data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: any) {
        return this.tablesService.update(id, data);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: TableStatus; guestId?: string }) {
        return this.tablesService.updateStatus(id, body.status, body.guestId);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.tablesService.delete(id);
    }
}
EOF

cat > /home/claude / tablenest / backend / src / modules / tables / tables.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';
import { Table, TableSchema } from './table.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: Table.name, schema: TableSchema }])],
    controllers: [TablesController],
    providers: [TablesService],
    exports: [TablesService],
})
export class TablesModule { }