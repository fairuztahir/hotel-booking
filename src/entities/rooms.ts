import { Length } from "class-validator";
import { number } from "joi";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, ManyToOne, JoinColumn } from "typeorm";
import { Hotels } from "./hotels";

@Entity()
export class Rooms {
    @Index()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @Column({ length: 10 })
    @Length(1, 10)
    name: string;

    @Column({ default: false, comment: "0 > Empty, 1 > Booked" })
    status?: boolean;

    // @Column({ default: 0 })
    // totalGuest: number;
    
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at?: Date;

    @UpdateDateColumn({ type: "timestamp", onUpdate: "CURRENT_TIMESTAMP", nullable: true, select: false })
    updated_at?: Date;

    @DeleteDateColumn({ type: "timestamp", select: false })
    deleted_at?: Date;

    @ManyToOne(type => Hotels, hotel => hotel.rooms, { cascade: true })
    @JoinColumn([{ name: "hotel_id", referencedColumnName: "id" }])
    hotel: Hotels;

}

export const roomSchema = {
    name: { type: "string", required: true, example: "A-01" },
    hotel_id: { type: "string", required: true, example: "3acc4cb6-90d3-440c-875d-c88a70348a91"}
};

export const updateRoomSchema = {
    name: { type: "string", required: true, example: "A-01" },
    status: { type: "boolean", required: false, example: false }
}