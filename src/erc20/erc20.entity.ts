import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Erc20Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  tracker: string;

  @Column({
    default: '',
  })
  name: string;

  @Column()
  symbol: string;

  @Column()
  decimals: number;
}


export type Erc20DTO = Omit<Erc20Token, 'id'>;
