import { IBase } from './base.type'

export interface ICoinPolicy extends IBase {
    key: string;
    name: string;
    description: string;
    value: string;
    isActive: boolean;
}

export interface IUpdateCoinPolicy {
    value: string
}


export interface IToggleCoinPolicy {
    isActive: boolean
}
