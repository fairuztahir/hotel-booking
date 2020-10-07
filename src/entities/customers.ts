import { IsEmail, Length } from "class-validator";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index, OneToMany } from "typeorm";
// import { Rooms } from "./rooms";

@Entity()
export class Customers {
    @Index()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Index()
    @Column({ length: 200 })
    name: string;

    @Column({ type: "numeric", precision: 12})
    ic_no: number;

    @Column()
    @Length(10, 100)
    @IsEmail()
    email: string;

    @Column()
    @Length(10, 12)
    phone_no: string;

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at?: Date;

    @UpdateDateColumn({ type: "timestamp", onUpdate: "CURRENT_TIMESTAMP", nullable: true, select: false })
    updated_at?: Date;

    @DeleteDateColumn({ type: "timestamp", select: false })
    deleted_at?: Date;

    // @OneToMany( type => Rooms, room => room.hotel )
    // rooms: Rooms[];

}

export const customerSchema = {
    name: { type: "string", required: true, example: "Ahmad Albab" },
    ic_no: { type: "number", required: true, example: 800101085991 },
    email: { type: "string", required: true, example: "ahmad.albab@gmail.com" },
    phone_no: { type: "number", required: true, example: 60173832222 }
};