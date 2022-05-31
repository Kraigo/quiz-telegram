import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm"
import { QuestionEntity } from "./question";
import { UserEntity } from "./user";

@Entity({name: "Quizes"})
export class QuizEntity {

    static from(options: QuizEntity) {
        return Object.assign(new QuizEntity(), options);
    }

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    chatId: number;

    @Column()
    hint: string;

    @Column()
    hintAvailable: boolean;

    @Column()
    start: Date;

    @Column({nullable: true})
    ended?: Date;

    @Column({default: false})
    isEnded: boolean;

    @OneToOne(() => UserEntity, {createForeignKeyConstraints: false})
    @JoinColumn()
    winner: UserEntity;

    @OneToOne(() => QuestionEntity, {createForeignKeyConstraints: false})
    @JoinColumn()
    question: QuestionEntity;
}