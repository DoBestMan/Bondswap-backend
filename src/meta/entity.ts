import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class OfficialAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  address: string;

  @Column({
    default: '',
  })
  comment: string;
}
