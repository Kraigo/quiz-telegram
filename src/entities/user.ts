import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity({name: "Users"})
export class UserEntity {

    static from(options: UserEntity) {
        return Object.assign(new UserEntity(), options);
    }

    @PrimaryColumn()
    id: number

    @Column()
    firstName: string;

    @Column({nullable: true})
    lastName?: string | undefined;

    @Column({nullable: true})
    username?: string | undefined;

    @Column({nullable: true})
    languageCode?: string | undefined;

    @Column({default: 0})
    score: number;
}