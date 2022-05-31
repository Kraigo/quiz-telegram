import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"
import { UserEntity } from "./user";

@Entity({name: "Questions"})
export class QuestionEntity {

    static from(options: QuestionEntity) {
        return Object.assign(new QuestionEntity(), options);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    answer: string;

    @Column({default: () => 'CURRENT_TIMESTAMP'})
    created: Date;

    @Column({default: false})
    isVerified: boolean;

}