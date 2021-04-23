import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
@Index('poolId', ['poolId'])
export class NFTPool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  poolId: number;

  @Column()
  lister: string;

  @Column()
  tokenType: number;

  @Column()
  tokenAddress: string;

  @Column()
  tokenId: number;

  @Column()
  batchCount: number;

  @Column()
  name: string;

  @Column({
    unique: true,
  })
  txHash: string;
  
  @Column()
  isPrivate: boolean;

  @Column()
  status: string;

  @Column()
  endTime: number;

  @Column()
  swapType: number;
}

@Entity()
@Index('poolId', ['poolId'])
@Index('txHash', ['txHash'])
export class NftJoinLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  poolId: number;

  @Column({
    unique: true,
  })
  txHash: string;
  
  @Column()
  count: number;

}