import { Entity, PrimaryColumn, JoinTable, OneToMany } from "typeorm"
import { QuizEntity } from "./quiz";

@Entity({name: "Chats"})
export class ChatEntity {

    static from(options: ChatEntity) {
        return Object.assign(new ChatEntity(), options);
    }

    @PrimaryColumn()
    id: number;

    @OneToMany(() => QuizEntity, (quiz) => quiz.chat)
    @JoinTable()
    quizzes: QuizEntity[];
}