
interface SwspCoreArgumentType{
    [key: string]: any;
    duration?: number;
}

interface Callback{
    (): void;
}

class TweenBase{
    private mElapsedT: number;
    
    get elapsedT(){ return this.mElapsedT }
    set elapsedT( v: number ){ this.mElapsedT = v }
    get isFinished(): boolean{ return this.checkFinish() }
    
    constructor(){
        this.mElapsedT =0;
        
    }

    protected checkFinish(): boolean{
        return true;
    }
    update( deltaT: number ){
        this.mElapsedT += deltaT;
        
    }
}

class Tween extends TweenBase{

    private mTarget: any;
    private mTweenArg: SwspCoreArgumentType;
    private mDuration: number;
    
    constructor( a: any, arg: SwspCoreArgumentType ){
        super();
        this.mTarget = a;
        this.mTweenArg = arg;
        this.mDuration = arg.duration;
        for( const[k,v] of Object.entries( this.mTweenArg ) ){
            if( a[k] !== undefined ){
                this.mTweenArg[k] -= a[k];
            }
        }
        console.log( "this.mTweenArg:", this.mTweenArg )
    }

    protected checkFinish(): boolean{
        return (this.elapsedT>=this.mDuration)
    }

    update( deltaT: number ){
        super.update( deltaT );
        const percent = deltaT/this.mDuration;

        for( const[k,v] of Object.entries( this.mTweenArg ) ){
            // console.log("k:", k, this.mTarget[k]);
                
            if( this.mTarget[k] !== undefined ) {
                this.mTarget[k] +=  (percent * v);
                // if(this.mTarget[k] >= v) this.mTarget[k] = v;
            }
        }
        // console.log( this.elapsedT, this.mTarget['q'] );
    }
}



class TweenDelayCall extends TweenBase{

    private mDelay: number;
    private mCallBackFunc: Callback;
    private mCallBackFlag: boolean;
    
    constructor(delay: number , callback: Callback){
        super();
        this.mDelay = delay;
        this.mCallBackFunc = callback;
        this.mCallBackFlag = false;
    }
    protected checkFinish(): boolean{
        return this.mCallBackFlag
    }
    update( deltaT: number ){
        super.update( deltaT );
        if(this.elapsedT >= this.mDelay) {
            if(!this.mCallBackFlag){
                this.mCallBackFunc();
                this.mCallBackFlag = true;
            }
        }
    }

}


class TweenTimeLine extends TweenBase{

    private mTweenArray: Array<TweenBase>;

    constructor(){
        super();
        this.mTweenArray = [];
    }
    protected checkFinish(): boolean{
        return this.mTweenArray.length == 0;
    }

    update( deltaT: number ){
        super.update( deltaT );
        this.mTweenArray[0].update(deltaT);
        if( this.mTweenArray[0].isFinished ){
            this.mTweenArray.splice(0,1);
            if(this.mTweenArray.length>0) this.mTweenArray[0].elapsedT = 0;
        }
    }
    
    to( a: any, arg: SwspCoreArgumentType ){
        const tween = new Tween( a, arg );
        this.mTweenArray.push( tween );
    }

    delayedCall(delay: number, callback: Callback ) {
        const tween = new TweenDelayCall( delay, callback );
        this.mTweenArray.push( tween );
    }
}


class SwspCore{
    
    // time 관련
    private _AppStartTimeBackup: number;
    private mElapsedT: number;
    private mDeltaT: number;
    
    get elapsedT(): number{ return this.mElapsedT }
    get deltaT(): number{ return this.mDeltaT }
    
    //------------------------------
    // tween 관련
    private mTweenArray: Array<TweenBase>;

    //------------------------------

    constructor(){
        this._AppStartTimeBackup = Date.now();
        this.mElapsedT = 0;
        this.mTweenArray = [];
    }

    to( a: any, arg: SwspCoreArgumentType ){
        const tween = new Tween( a, arg );
        this.mTweenArray.push( tween );
    }

    delayedCall(delay: number, callback: Callback ) {
        const tween = new TweenDelayCall( delay, callback );
        this.mTweenArray.push( tween );
    }

    timeline(): TweenTimeLine{
        const tween = new TweenTimeLine();
        this.mTweenArray.push( tween );
        return tween;
    }
    _timeProc(){
        // deltaT계산
        this.mDeltaT = ((Date.now() - this._AppStartTimeBackup) / 1000) - this.mElapsedT;    
        // elapseT
        this.mElapsedT = ((Date.now() - this._AppStartTimeBackup) / 1000);
    }

    _tweenProc(){
        // mTweenArray 돌면서 증가 처리.
        const temp = [];
        for( const tween of this.mTweenArray ){
            tween.update( this.mDeltaT );
            if( !tween.isFinished ){
                temp.push( tween );
            }
        }
        this.mTweenArray = temp;
    }

    _loopProc(){
        // Time처리
        this._timeProc();
        this._tweenProc();
        // console.log( this.deltaT.toFixed( 3 ) , this.elapsedT);
    }

}

const _handle = new SwspCore();

function _loop(){
    _handle._loopProc();
    requestAnimationFrame( _loop )
}
_loop();



export {
    _handle as swsp,
    _handle as default
}
