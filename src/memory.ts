import { AppDataSource } from "./data-source";
import { QuestionEntity, QuizEntity, UserEntity } from "./entities";

export class Memory {
    questionsRepository = AppDataSource.getRepository(QuestionEntity);
    quizesRepository = AppDataSource.getRepository(QuizEntity);
    usersRepository = AppDataSource.getRepository(UserEntity);
    
    async addQuestion(title: string, answer: string): Promise<QuestionEntity> {
        const question = QuestionEntity.from({
            id: null,
            title,
            answer,
            isVerified: false,
            created: new Date()
        })

        return AppDataSource.manager.save(question)
    }

    async addQuiz(chatId: number, question: QuestionEntity): Promise<QuizEntity> {
        const hint = question.answer.split('').map(a => '_').join('');

        const quiz = QuizEntity.from({
            id: null,
            start: new Date(),
            chatId,
            question,
            hint,
            hintAvailable: false,
            isEnded: false,
            ended: null,
            winner: null
        })

        return AppDataSource.manager.save(quiz);
    }

    getQuiz(predicate: Partial<QuizEntity>): Promise<QuizEntity> {
        return this.quizesRepository.findOne({
            where: {
                isEnded: false,
                ...predicate
            },
            relations: {
                question: true
            }
        });
    }

    getQuizzes(predicate: Partial<QuizEntity>): Promise<QuizEntity[]> {
        return this.quizesRepository.find({
            where: {
                ...predicate
            },
            relations: {
                question: true
            }
        })
    }

    async updateQuiz(quizId: number, update: Partial<QuizEntity>): Promise<void> {
        await this.quizesRepository.update({id: quizId}, update);
    }

    getQuestions(predicate: Partial<QuestionEntity>) {
        return this.questionsRepository.find({
            where: {
                ...predicate
            },
            take: 200
        })
    }

    getRandomQuestion(): Promise<QuestionEntity | null> {
        return this.questionsRepository
            .createQueryBuilder()
            .orderBy("RANDOM()")
            .limit(1)
            .getOne()
    }

    getHint() {

    }

    getUser(userId: number): Promise<UserEntity> {
        return this.usersRepository.findOneBy({ id: userId });
    }

    addUser(userId: number, options: Partial<UserEntity>): Promise<UserEntity> { 
        const user = UserEntity.from({
            id: userId,
            firstName: options.firstName,
            score: 0,
            ...options
        });

        return AppDataSource.manager.save(user);
    }
}