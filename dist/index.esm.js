class t{constructor(){this.isDisposed=!1,this.callbacks=[],this.id=requestAnimationFrame(this.handle=this.handle.bind(this))}static get instance(){var e;return null!==(e=this._instance)&&void 0!==e?e:this._instance=new t}set onTick(t){this.callbacks.push(t)}addListener(t){console.assert(!this.callbacks.includes(t),"Already exists a given callback function."),this.callbacks.push(t)}removeListener(t){console.assert(this.callbacks.includes(t),"Already not exists a given callback function."),this.callbacks=this.callbacks.filter((e=>e!==t))}notifyTick(t){this.callbacks.forEach((e=>e(t)))}handle(t){var e;if(this.isDisposed)return;const s=t-(null!==(e=this.previousElapsed)&&void 0!==e?e:t);this.previousElapsed=t,this.notifyTick(s),this.id=requestAnimationFrame(this.handle)}dispose(){this.isDisposed=!0,cancelAnimationFrame(this.id)}}class e{constructor(e){this.callback=e,t.instance.addListener(e)}dispose(){t.instance.removeListener(this.callback)}}var s;!function(t){t.NONE="none",t.FORWARD="forward",t.FORWARDED="forwarded",t.BACKWARD="backward",t.BACKWARDED="backwarded"}(s||(s={}));class i{}class n extends i{constructor(){super(...arguments),this.listeners=[],this.statusListeners=[]}addListener(t){console.assert(!this.listeners.includes(t),"Already a given listener does exist."),this.listeners.push(t)}removeListener(t){console.assert(this.listeners.includes(t),"Already a given listener does not exist."),this.listeners=this.listeners.filter((e=>e!=t))}addStatusListener(t){console.assert(!this.statusListeners.includes(t),"Already a given status listener does exist."),this.statusListeners.push(t)}removeStatusListener(t){console.assert(this.statusListeners.includes(t),"Already a given status listener does not exist."),this.statusListeners=this.statusListeners.filter((e=>e!=t))}notifyListeners(t){this.listeners.forEach((e=>e(t)))}notifyStatusListeners(t){this.statusListeners.forEach((e=>e(t)))}}class r extends n{get status(){return this._status}set status(t){this._status!=t&&this.notifyStatusListeners(this._status=t)}get value(){return this._value}set value(t){this._value!=t&&this.notifyListeners(this._value=t)}constructor(t,e=0,i=1,n=e){if(super(),this.duration=t,this.lowerValue=e,this.upperValue=i,this._status=s.NONE,console.assert(null!=t,"An animation duration cannot be null."),console.assert(0!=t,"An animation duration cannot be 0."),this.lowerValue>this.upperValue)throw new Error("The lowerValue must be less than the upperValue.");this._value=n}get range(){return this.upperValue-this.lowerValue}get relValue(){return(this.value-this.lowerValue)/this.range}get progressValue(){const t=this.tween.begin,e=this.tween.end-t;return(this.relValue-t)/e}forward(t){this.animateTo(this.upperValue,t)}backward(t){this.animateTo(this.lowerValue,t)}repeat(){this.addStatusListener((t=>{t==s.FORWARDED&&this.backward(),t==s.BACKWARDED&&this.forward()})),this.status!=s.NONE&&this.status!=s.BACKWARDED||this.forward()}animateTo(t,e){this.animate(this.value,t,e)}animate(t,i,n=this.duration){var r;if(i==t)return;console.assert(t>=this.lowerValue,"A given [from] is less than the min-range."),console.assert(i<=this.upperValue,"A given [to] is larger than the max-range."),this.value=t,this.tween={begin:t,end:i};const a=i>t;this.status=a?s.FORWARD:s.BACKWARD;const h=n/this.range;null===(r=this.activeTicker)||void 0===r||r.dispose(),this.activeTicker=new e((e=>{const n=e/h,r=a?n:-n,u=this.consume(t,i,r);if(Math.abs(r-u)>1e-10)return this.value=i,this.dispose(),void(this.status=a?s.FORWARDED:s.BACKWARDED);this.value+=u}))}consume(t,e,s){const i=e-(this.value+s);return e>t?i<=0?i:s:i>=0?i:s}dispose(){var t;null===(t=this.activeTicker)||void 0===t||t.dispose(),this.activeTicker=null}reset(){this.status=s.NONE,this.value=this.lowerValue,this.tween=null}}class a{constructor(t,e,s,i=1){if(this.red=t,this.green=e,this.blue=s,this.alpha=i,this.red>255||this.red<0||this.green>255||this.green<0||this.blue>255||this.blue<0||this.alpha>1||this.alpha<0)throw new Error("The color values given is extent overflowed. ex: new Color(0~255, 0~255, 0~255, 0~1)")}toHex(){const t=t=>{const e=Math.round(t).toString(16);return 1==e.length?"0"+e:e};return`#${t(this.red)}${t(this.green)}${t(this.blue)}${t(255*this.alpha)}`}static var(t,e){const s=window.getComputedStyle(e||document.documentElement).getPropertyValue(t).trim();if(""===s)throw new Error("The hex color format of the given name could not be found.");return this.parse(s)}static parse(t){const e=t.startsWith("#")?t.slice(1,t.length):t;let s=0,i=0,n=0,r=8==e.length?parseInt(e.slice(6,8),16)/255:1;if(6!=e.length&&8!=e.length)throw new Error("The given string is unvalid. (ex: #202020 or #202020FF)");return s=parseInt(e.slice(0,2),16),i=parseInt(e.slice(2,4),16),n=parseInt(e.slice(4,6),16),new a(s,i,n,r)}toString(){return this.toHex()}}class h{}class u extends h{constructor(t,e){super(),this.begin=t,this.end=e}transform(t){return this.begin+(this.end-this.begin)*t}}class o extends h{constructor(t,e){super(),this.begin=t,this.end=e}transform(t){const e=this.begin,s=this.end,i=(t,e,s)=>t+(e-t)*s;return new a(i(e.red,s.red,t),i(e.green,s.green,t),i(e.blue,s.blue,t),i(e.alpha,s.alpha,t))}}class l extends n{constructor(t,e,i){super(),this.curve=e,this.status=s.NONE,this.value=null!=i?i:0,this.parent=new r(t,0,1),this.parent.addListener((t=>{const s=this.parent.progressValue;if(null==e)return void this.notifyListeners(this.value=this.tween.transform(s));const i=e.transform(s),n=this.tween.end-this.tween.begin,r=this.tween.begin+n*i;this.notifyListeners(this.value=r)})),this.parent.addStatusListener((t=>{if(t==s.NONE)return;const e=this.tween.end>this.tween.begin;t==s.FORWARD?this.notifyStatusListeners(this.status=e?s.FORWARD:s.BACKWARD):this.notifyStatusListeners(this.status=e?s.FORWARDED:s.BACKWARDED)}))}animateTo(t){t!=this.value&&this.animate(this.value,t)}animate(t,e){this.tween=new u(t,e),this.parent.reset(),this.parent.forward()}dispose(){this.tween=null,this.parent.dispose(),this.parent=null}}class c{constructor(t,e){this.x=t,this.y=e}lerp(t,e){const s=this.x+(t.x-this.x)*e,i=this.y+(t.y-this.y)*e;return new c(s,i)}}class d{constructor(t,e,s,i,n=new c(0,0),r=new c(1,1),a=1e-4){this.errorBound=a,this.p1=n,this.p2=new c(t,e),this.p3=new c(s,i),this.p4=r}get flipped(){return new d(1-this.p2.x,1-this.p2.y,1-this.p3.x,1-this.p3.y,this.p1,this.p4,this.errorBound)}at(t){const e=this.p1,s=this.p2,i=this.p3,n=this.p4,r=e.lerp(s,t),a=s.lerp(i,t),h=i.lerp(n,t),u=r.lerp(a,t),o=a.lerp(h,t);return u.lerp(o,t)}transform(t){if(t<0||t>1)throw new Error("In the transform function of the Cubic, t must be given from 0 to 1.");if(0==t)return this.p1.y;if(1==t)return this.p4.y;let e=0,s=1;for(;;){const i=(e+s)/2,n=this.at(i);if(Math.abs(t-n.x)<this.errorBound)return n.y;n.x<t?e=i:s=i}}createAnimation(t){return new l(t,this)}static var(t,e){const s=window.getComputedStyle(e||document.documentElement).getPropertyValue(t).trim();if(""===s)throw new Error("The cubic format value of the given name could not be found.");return this.parse(s)}static parse(t){const e=t.match(/([0-9.]+)/g).map(Number);if(4!=e.length)throw new Error("The given [str] format is invalid. (ex: cubic-bezier(0,1,0,1))");return new d(e[0],e[1],e[2],e[3])}toString(){return`Cubic(${this.p2.x}, ${this.p2.y}, ${this.p3.x}, ${this.p3.y})`}}const p={Linear:new d(0,0,1,1),Ease:new d(.25,.1,.25,1),EaseIn:new d(.42,0,1,1),EaseOut:new d(0,0,.58,1),EaseInOut:new d(.42,0,.58,1),EaseInSine:new d(.12,0,.39,0),EaseOutSine:new d(.61,1,.88,1),EaseInQuad:new d(.11,0,.5,0),EaseOutQuad:new d(.5,1,.89,1),EaseInOutQuad:new d(.45,0,.55,1),EaseInOutSine:new d(.37,0,.63,1),EaseInCubic:new d(.32,0,.67,0),EaseOutCubic:new d(.33,1,.68,1),EaseInOutCubic:new d(.65,0,.35,1),EaseInQuart:new d(.5,0,.75,0),EaseOutQuart:new d(.25,1,.5,1),EaseInOutQuart:new d(.76,0,.24,1),EaseInQuint:new d(.64,0,.78,0),EaseOutQuint:new d(.22,1,.36,1),EaseInOutQuint:new d(.83,0,.17,1),EaseInExpo:new d(.7,0,.84,0),EaseOutExpo:new d(.16,1,.3,1),EaseInOutExpo:new d(.87,0,.13,1),EaseInCirc:new d(.55,0,1,.45),EaseOutCirc:new d(0,.55,.45,1),EaseInOutCirc:new d(.85,0,.15,1),EaseInBack:new d(.36,0,.66,-.56),EaseOutBack:new d(.34,1.56,.64,1),EaseInOutBack:new d(.68,-.6,.32,1.6)};export{i as Animatable,l as Animation,r as AnimationController,n as AnimationListenable,s as AnimationStatus,a as Color,o as ColorTween,d as Cubic,c as CubicPoint,p as Curve,u as NumberTween,e as Ticker,h as Tween};
//# sourceMappingURL=index.esm.js.map
