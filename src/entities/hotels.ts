import { IsEmail, Length } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index } from "typeorm";

@Entity()
export class Hotels {
    @Index()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @Column({ length: 80 })
    @Length(10, 80)
    name: string;

    @Column({ length: 100})
    address?: string;

    @Column({ length: 100 })
    @Length(10, 100)
    @IsEmail()
    email: string;
    
    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at?: Date;

    @UpdateDateColumn({ type: "timestamp", onUpdate: "CURRENT_TIMESTAMP", nullable: true, select: false })
    updated_at?: Date;

    @DeleteDateColumn({ type: "timestamp", select: false })
    deleted_at?: Date;

}

export const hotelSchema = {
    // id: { type: "string", required: true, example: "7182a93e-a7d9-4d5c-b51c-a73d1731a53f" },
    name: { type: "string", required: true, example: "Hotel Pegasus" },
    address: { type: "string", required: false, example: "Jalan Penuh Berliku" },
    email: { type: "string", required: true, example: "admin@pegasushotel.com" }
};