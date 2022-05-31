import { AppDataSource } from "./data-source";
import { QuestionEntity, QuizEntity, UserEntity } from "./entities";

export class Memory {
    questionsRepository = AppDataSource.getRepository(QuestionEntity);
    quizesRepository = AppDataSource.getRepository(QuizEntity);
    usersRepository = AppDataSource.getRepository(UserEntity);

    // QUESTION

    getQuestion(questionId: number): Promise<QuestionEntity> {
        return this.questionsRepository.findOneBy({id: questionId});
    }

    getQuestions(predicate: Partial<QuestionEntity>) {
        return this.questionsRepository.find({
            where: {
                ...predicate
            },
            take: 200
        })
    }

    getRandomQuestion(predicate?: Partial<QuestionEntity>): Promise<QuestionEntity | null> {
        return this.questionsRepository
            .createQueryBuilder()
            .orderBy("RANDOM()")
            .limit(1)
            .where(predicate)
            .getOne()
    }
    
    async addQuestion(title: string, answer: string): Promise<QuestionEntity> {
        const question = QuestionEntity.from({
            id: null,
            title,
            answer,
            isVerified: null,
            created: new Date()
        })

        return AppDataSource.manager.save(question)
    }

    async updateQuestion(quizId: number, update: Partial<QuestionEntity>): Promise<void> {
        await this.questionsRepository.update({id: quizId}, update);
    }

    // QUIZ

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

    // USER

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

    async getTopUser(chatId: number): Promise<UserEntity[]> {
        const quizes = await this.quizesRepository.find({
            where: {
                chatId,
                isEnded: true
            },
            relations: {
                winner: true
            }
        });

        const group: {[key: string]: UserEntity} = {};

        for (let quiz of quizes) {
            const userId = quiz.winner.id;
            if (userId in group) {
                continue
            }
            group[userId] = quiz.winner;
        }

        const users = Object.values(group).sort((a,b) => a.score - b.score);

        return users.slice(0, 10);
    }

    async updateUserScope(userId: number, scope: number): Promise<UserEntity> {
        const user = await this.usersRepository.findOneBy({id: userId});
        user.score += scope;

        return AppDataSource.manager.save(user);
    }
}