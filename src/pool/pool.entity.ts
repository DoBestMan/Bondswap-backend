import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { PoolStatus } from 'src/typings/type';

@Entity()
@Index('tracker_dex', ['tracker'])
@Index('poolId', ['poolId'])
// @Index(['poolId', 'priv', 'isFloat'], { unique: true })
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  poolId: number;

  @Column({
    default: '',
    charset: 'utf8mb4',
  })
  name: string;

  @Column()
  maker: string;

  // private fixed
  @Column({
    default: false,
  })
  priv?: boolean;

  @Column()
  tracker: string;

  @Column({
    default: '',
  })
  amount: string;

  // fixed
  @Column({
    default: '',
  })
  leftAmount?: string;

  // float
  // eth 总额
  @Column({
    default: '',
  })
  takerAmount?: string;

  // pool 的作者可以取的 eth 总额
  @Column({
    default: '',
  })
  makerAmount?: string;

  @Column({
    default: '',
  })
  rate?: string;

  @Column({
    default: '',
  })
  units?: string;

  @Column({
    default: false,
  })
  closed?: boolean;

  @Column({
    unique: true
  })
  txHash: string;

  @Column({
    default: '',
  })
  blockHash: string;

  @Column()
  endTime: number;

  @Column({
    length: 1500,
    default: '',
  })
  extra?: string;

  @Column({
    default: false,
  })
  isFloat: boolean;

  @Column({
    default: 'Live',
  })
  status: PoolStatus;

  @Column({
    default: 0,
  })
  createAt: number;

  @Column({
    default: '',
  })
  contract: string;
}

@Entity()
@Index('tracker_dex', ['tracker'])
@Index('poolId', ['poolId'])
@Index('taker', ['taker'])
// @Index(['poolId', 'priv', 'isFloat', 'taker', 'txHash'], { unique: true })
export class JoinLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  poolId: number;

  @Column()
  taker: string;

  @Column({
    default: false,
  })
  priv?: boolean;

  @Column()
  ethAmount: string;

  @Column({
    default: '',
  })
  amount: string;

  @Column()
  tracker: string;

  @Column({
    unique: true
  })
  txHash: string;

  @Column({
    default: '',
  })
  blockHash: string;

  @Column({
    default: false,
  })
  isFloat: boolean;

  @Column({
    default: 0,
  })
  createAt: number;

  @Column({
    default: '',
  })
  contract: string;
}

@Entity()
export class State {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  key: string;

  @Column()
  value: string;
}

export type FixedPool = Omit<Pool, 'takerAmount' | 'makerAmount'>;

export type FloatPool = Omit<Pool, 'priv' | 'leftAmount' | 'rate' | 'units' | 'extra'>;

export interface PoolDTO extends Pool {
  trackerSymbol: string;
  trackerDecimals: number;
}
