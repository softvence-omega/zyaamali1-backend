

export interface IToken {
    inputToken: string;
    outputToken: string;
}




export interface Iconfigure {
    dollerPerToken: number;
    dailyTokenLimit: number;
    models: {
        [key: string]: IToken;
    }

}