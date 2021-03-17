(function(window,undefined){
    //函数入口  selector为传入的值
    var dQuery = function(selector){
        //调用dQuery原型中的init方法
        return new dQuery.prototype.init(selector);  
    }
    //函数原型
    dQuery.prototype = {
        constructor:dQuery,
        //首先判断传入的值
        init:function(selector){
            //0.去除字符串两端的空格  否则结果为空
            selector = dQuery.trim(selector);
            //1.传入 空 null undefined NaN 0 false 返回空的jQuery对象
             if(!selector){
                //return this;  //优化：this可放到最后
             }
             //传入方法
             else if (dQuery.isFunction(selector)) {
                 dQuery.ready(selector);
             }
             //2传入字符串
             else if(dQuery.isString(selector)){
                 //2.1判断是不是代码片段
                 if(dQuery.isHtml(selector))
                {
                   //1.根据代码片段创建所有元素
                   var temp = document.createElement("div");
                   temp.innerHTML = selector;
                 /* 
                   //2.将创建好的一级元素添加到jQuery中
                   for(var i=0;i<temp.children.length;i++){
                       this[i] = temp.children[i];
                   }
                   //3.给jQuery对象添加length属性
                   this.length = temp.children.length; 
                 */
                //第二三步的巧妙方法：
                   [].push.apply(this,temp.children);  
                   //4.返回加工好的this(jQuery)
                   //return this;
                }
                //2.2判断是不是选择器
                else{
                    //1.根据传入的选择器找到所有的元素
                    var res = document.querySelectorAll(selector);
                    //2.类似上面的2 3步
                    [].push.apply(this,res)
                    //3.返回加工上的this
                   // return this;
                }
             }
             //3.传入数组
            /*  else if(typeof selector ==="object" &&
             "length" in selector &&
             selector !=window */
             else if(dQuery.isArray(selector)
             ){ 
                //真伪数组区分可以靠toString()方法
                //真数组toString得到逗号连接的字符串，伪数组得到[object,object]
                //3.1传入真数组
                /* if(({}).toString.apply(selector) === "[object Array]"){
                    //转换为伪数组
                    [].push.apply(this,selector);
                    return this;
                }
                //3.2传入伪数组
                else{
                    //将伪数组转换为真数组
                    var arr = [].slice.call(selector);
                    //将真数组转换为伪数组
                    [].push.apply(this,arr);
                    return this;
                } */
                //优化代码
                //将伪数组转换为真数组
                var arr = [].slice.call(selector);
                [].push.apply(this,selector);
                //return this;
             }
             //4.除上述类型以外
              else{
                  this[0] = selector;
                  this.length = 1;
                  //return this;
              }
              return this;
        },
        //jQuery原型上的属性
        dQuery : "1.1.0",
        selector:"",
        length : 0,
        push : [].push,
        sort : [].sort,
        splice : [].splice,
        //jQuery原型上的方法
        toArray:function(){
            return [].slice.call(this);
        },
        get:function(num){
            //无参数
            if (arguments.length === 0) {
                return this.toArray();
            }
            //传正数
            else if(num>=0){
                return this[num];
            }
            //传负数
            else{
                return this[this.length + num];
            }
        },
        eq:function(num){
            //无参数
            if(arguments.length === 0){
                return new dQuery();
            }
            //正数 负数 可优化如下
            else{
                return dQuery(this.get(num));
            }
        },
        first:function(){
            return this.eq(0);
        },
        last:function(){
            return this.eq(-1);
        },
        each:function(fn){
            dQuery.each(this,fn);  //this就是传入的要遍历的对象
        }

    }


    //采用这种方式既可通过类调用添加静态方法 例如：dQuery.extend({})，
    //也可通过对象调用添加实例方法 例如：var a = new dQuery(); a.extend({})
    //更重要的一点：此时的this就是dQuery,遍历给dQuery对象添加所有的工具方法，这样就可以实现$.each这样的操作了
    dQuery.extend = dQuery.prototype.extend = function (obj){    
        for(var key in obj){
            this[key] = obj[key];
        }
    }

    //调用dQuery上的extend方法，传入一个对象，对象中全是工具方法
    //装工具方法
    dQuery.extend({
            //判断方法
    isFunction : function(sel){
        return typeof sel === "function";
    },
    //封装判断字符串和代码片段的方法
    isString : function(str){
        return typeof str === "string";
    },
    isHtml : function(str){
        return str.charAt(0) == "<" && 
        str.charAt(str.length-1) == ">" &&
        str.length >=3
    },
    //封装判断对象 数组 window的方法
    isObject : function(sel){
        return typeof sel === "object"
    },
    isWindow : function (sel){
        return sel === window;
    },
    isArray : function(sel){
        if(dQuery.isObject(sel)&&
            !dQuery.isWindow(sel)&&
            "length" in sel){
                return true;
            }
        return false;
    },
    //去除传入字符串的空格
    trim : function (str){
        if(!dQuery.isString(str)){
            return str;
        }
        if(str.trim){
            return str.trim();
        }else{
            return str.replace(/^\s+|\s+$/g,"")
        }
    },
    //函数处理
    ready : function(fn){
        //判断DOM是否加载完毕
        if(document.readyState == "complete"){
            fn();
        }
        else if(document.addEventListener){   //高级浏览器
            document.addEventListener("DOMContentLoaded",function(){
                fn();
            })
        }
        else{            //lowB浏览器
            document.attachEvent("onreadystatechange",function(){
                if(document.readyState == "complete"){
                    fn();
                }
            })
        }
    },
    each:function(obj,fn){
        //真数组
        if(dQuery.isArray(obj)){
            for(var i=0;i < obj.length;i++){
                //fn(i,obj[i]);   //回调函数
                var res = fn.call(obj[i],i,obj[i]);       //使this指向value
                if(res === true){                          //根据布尔值决定是否跳出循环
                    continue;
                }else if(res === false){
                    break;
                }
            }
        }
        //伪数组
        else if(dQuery.isObject(obj)){
            for(var key in obj ){
                //fn(key,obj[key]);
                var res = fn.call(obj[key],key,obj[key]);
                if(res === true){
                    continue;
                }else if(res === false){
                    break;
                }
            }
        }
    },
    map:function(obj,fn){
        var res = [];   //map中的返回值res
        //是否是数组
        if(dQuery.isArray(obj)){
            for(var i=0;i < obj.length;i++){
                var temp = fn(obj[i],i);  //执行回调函数，结果赋值给temp
                if(temp){              //jQuery中回调函数有值的时候，才执行此操作，否则结果为空,若不加此判断，就会是undefined
                    res.push(temp);
                }
            }
        }
        //是否是对象
        else if(dQuery.isObject(obj)){
            for(var key in obj ){
                var temp = fn(obj[key],key);
                if(temp){
                    res.push(temp);
                }
            }
        }
        return res;
    },
    //兼容获取元素属性的方法：
    getStyle:function(dom,styleName){
        if(window.getComputedStyle){
            return window.getComputedStyle(dom)[styleName];
        }else{
            return dom.currentStyle[styleName];  //ie
        }
    },
    //兼容添加事件：
    addEvent:function(dom,name,callBack){
        if(dom.addEventListener){
            dom.addEventListener(name,callBack);
        }else{
            dom.attachEvent("on"+name,callBack);
        }
    }

    })

    //dom操作相关方法：
    dQuery.prototype.extend({
        empty:function(){
            //遍历找到所有元素
            this.each(function(key,value){
                value.innerHTML = "";
            });
            return this;        //jQuery链式调用的关键
        },
        remove:function(sel){
            if(arguments.length === 0){   //没有传值全部删除
               //1.遍历指定元素
               this.each(function(key,value){
                   //根据遍历的元素找到父元素
                   var parent = value.parentNode;
                   //通过父元素删除指定的元素
                   parent.removeChild(value);
               })
            }else{
                //传入选择器作为判断条件的情况  
                //首先找到所有该条件下的元素及其标签名，然后遍历前面指定元素，对比其tagName，删除
                var $this = this;
                //1.根据传入的选择器找到对应的元素
                $(sel).each(function(key,value){    //此处在我们上面定义的入口函数中已经定义过了
                    //2.遍历找到的元素，获取对应的标签名
                    var type = value.tagName;
                    //3.遍历指定的元素
                    $this.each(function(k,v){
                        //4.获取指定元素的类型
                        var t = v.tagName;
                        //5.判断找到元素的类型和指定元素的类型
                        if(t === type){
                            //根据遍历的元素找到父元素
                            var parent = value.parentNode;
                            //通过父元素删除指定的元素
                            parent.removeChild(value);
                        }
                    })
                })
            }
            return this;
        },
        html:function(content){
            if(arguments.length === 0){
                  return this[0].innerHTML;
            }else{
                this.each(function(k,v){
                    v.innerHTML = content;
                })
            }
        },
        text:function(content){
            if(arguments.length === 0){
                var res = "";
                this.each(function(key,value){   //无参数则返回指定元素所有的文本内容
                    res += value.innerText;
                });
                return res;
            }else{
                this.each(function(key,value){
                    value.innerText = content;
                })
            }
        },
        appendTo:function(sele){
             //统一将传入的数据转换为jQuery对象  因为官方jQuery中可以传入三种数据类型（字符串 jQuery对象 DOM元素）
             //这样直接传到入口函数中处理明显更简便
             var $target = $(sele);

             var $this = this;
             var res = [];      //定义一个返回值，存放插入的元素
             //1.遍历取出所有后面指定的元素
             $.each($target,function(key,value){
                 //遍历取出所有前面的元素
                 $this.each(function(k,v){
                     //判断当前是否是第0个后面指定的元素
                     if(key === 0){
                         //直接添加
                         value.appendChild(v);
                         res.push(v);   
                     }else{
                         //先拷贝再添加
                         var temp = v.cloneNode(true)   //true代表内容也复制
                         value.appendChild(temp);
                         res.push(temp);
                     }
                 })
             });
             //返回所有添加的元素
             return $(res);
        },
        //与appendTo极其相似，稍作修改即可
        prependTo:function(sele){
            //统一将传入的数据转换为jQuery对象  因为官方jQuery中可以传入三种数据类型（字符串 jQuery对象 DOM元素）
             //这样直接传到入口函数中处理明显更简便
             var $target = $(sele);

             var $this = this;
             var res = [];      //定义一个返回值，存放插入的元素
             //1.遍历取出所有后面指定的元素
             $.each($target,function(key,value){
                 //遍历取出所有前面的元素
                 $this.each(function(k,v){
                     //判断当前是否是第0个后面指定的元素
                     if(key === 0){
                         //直接添加
                         value.insertBefore(v,value.firstChild);
                         res.push(v);   
                     }else{
                         //先拷贝再添加
                         var temp = v.cloneNode(true);   //true代表内容也复制
                         value.insertBefore(temp,value.firstChild);
                         res.push(temp);
                     }
                 })
             });
             //返回所有添加的元素
             return $(res);
        },
        append:function(sele){
            //判断传入sele的参数是否是字符串
            if(dQuery.isString(sele)){
                this[0].innerHTML+=sele;  //加入该字符串
            }else{
                $(sele).appendTo(this);
            }
            return this;
        },
        prepend:function(sele){
            //判断传入sele的参数是否是字符串
            if(dQuery.isString(sele)){
                this[0].innerHTML=sele + this[0].innerHTML;  //加入该字符串
            }else{
                $(sele).prependTo(this);
            }
            return this;
        },
        //jquery中insertBefore是插入元素外部的前面
        //原生js的insertBefore是插入到元素内部的前面，所以我们只需要找到该元素的父元素就可以改为插入内部
        insertBefore:function(sele){
            //统一将传入的数据转换为jQuery对象  因为官方jQuery中可以传入三种数据类型（字符串 jQuery对象 DOM元素）
             //这样直接传到入口函数中处理明显更简便
             var $target = $(sele);

             var $this = this;
             var res = [];      //定义一个返回值，存放插入的元素
             //1.遍历取出所有后面指定的元素
             $.each($target,function(key,value){
                 //遍历取出所有前面的元素
                 var parent = value.parentNode;
                 $this.each(function(k,v){
                     //判断当前是否是第0个后面指定的元素
                     if(key === 0){
                         //直接添加
                         parent.insertBefore(v,value);   //插入到parent内部第一个元素之前
                         res.push(v);   
                     }else{
                         //先拷贝再添加
                         var temp = v.cloneNode(true)   //true代表内容也复制
                         parent.insertBefore(temp,value);   //插入到parent内部第一个元素之前
                         res.push(temp);
                     }
                 })
             });
             //返回所有添加的元素
             return $(res);
        },
        replaceAll:function(sele){
             //统一将传入的数据转换为jQuery对象  因为官方jQuery中可以传入三种数据类型（字符串 jQuery对象 DOM元素）
             //这样直接传到入口函数中处理明显更简便
             var $target = $(sele);

             var $this = this;
             var res = [];      //定义一个返回值，存放插入的元素
             //1.遍历取出所有后面指定的元素
             $.each($target,function(key,value){
                 //遍历取出所有前面的元素
                 var parent = value.parentNode;
                 $this.each(function(k,v){
                     //判断当前是否是第0个后面指定的元素
                     if(key === 0){
                         //1.将元素添加到指定元素的前面
                         $(v).insertBefore(value);
                         //2.将指定元素删除
                         $(value).remove();
                         res.push(v);
                     }else{
                         //先拷贝再添加
                         var temp = v.cloneNode(true)   //true代表内容也复制
                         //1.将元素添加到指定元素的前面
                         $(temp).insertBefore(value);
                         //2.将指定元素删除
                         $(value).remove();
                         res.push(temp);
                     }
                 })
             });
             //返回所有添加的元素
             return $(res);
        },
        clone:function(deep){
            var res = [];
            //判断是否是深复制
            if(deep){
                //深复制  复制事件
                this.each(function(key,ele){
                    var temp = ele.cloneNode(true);
                    //遍历元素中的eventsCache对象
                    dQuery.each(ele.eventsCache,function(name,array){
                        //遍历事件对应的数组
                        dQuery.each(array,function(index,method){
                            //给复制的元素添加事件
                            $(temp).on(name,method);
                        })
                    })
                    res.push(temp)
                })
                return $(res);
            }else{
                //浅复制
                this.each(function(key,ele){
                    var temp = ele.cloneNode(true);
                    res.push(temp);
                });
                return $(res);
            }
            //return $(res);
        }
    })
    
    //属性操作相关方法：
    dQuery.prototype.extend({
        attr:function(attr,value){
            //1.判断是否是字符串
            if(dQuery.isString(attr)){
                //判断是一个字符还是两个字符
                if(arguments.length === 1){
                    return this[0].getAttribute(attr)   //一个参数直接返回属性值
                }else{
                    this.each(function(key,ele){  //遍历前面元素
                         //给元素添加属性
                         ele.setAttribute(attr,value);
                    })
                }
            }
            //2.判断是否是对象
            if(dQuery.isObject(attr)){
                var $this = this;
                //遍历取出所有属性节点的名称和对应的值
                $.each(attr,function(key,value){
                    //遍历取出所有的元素
                    $this.each(function(k,ele){
                        ele.setAttribute(key,value);
                    })
                })
        }
        return this;
        },
        //attr操作属性节点，prop操作属性  属性节点就是元素的attributes
        //注意属性要去控制台 sources watch中查找
        prop:function(attr,value){
            //1.判断是否是字符串
            if(dQuery.isString(attr)){
                //判断是一个字符还是两个字符
                if(arguments.length === 1){
                    return this[0][attr];   
                }else{
                    this.each(function(key,ele){  //遍历前面元素
                         //给元素添加属性
                         ele[attr] = value;   //操作属性
                    })
                }
            }
            //2.判断是否是对象
            if(dQuery.isObject(attr)){
                var $this = this;
                //遍历取出所有属性节点的名称和对应的值
                $.each(attr,function(key,value){
                    //遍历取出所有的元素
                    $this.each(function(k,ele){
                        ele[key] = value;
                    })
                })
        }
        return this;
        },
        //与prop雷同
        css:function(attr,value){
            //1.判断是否是字符串
            if(dQuery.isString(attr)){
                //判断是一个字符还是两个字符
                if(arguments.length === 1){
                    return dQuery.getStyle(this[0],attr);   
                }else{
                    this.each(function(key,ele){  //遍历前面元素
                         ele.style[attr] = value;
                    })
                }
            }
            //2.判断是否是对象
            if(dQuery.isObject(attr)){
                var $this = this;
                //遍历取出所有属性节点的名称和对应的值
                $.each(attr,function(key,value){
                    //遍历取出所有的元素
                    $this.each(function(k,ele){
                        ele.style[key] = value;
                    })
                })
        }
        return this;
        },
        //这个方法利用的原理就是input不仅有个属性节点叫value，同时还有个属性也叫value
        //利用属性就可以实现value的实时更新
        val:function(content){
            if(arguments.length === 0){
                //没有传参
                return this[0].value;
            }else{
                this.each(function(key,ele){
                    ele.value = content;
                });
                return this;
            }
        },
        hasClass:function(name){
            var flag = false;
            if(arguments.length === 0){
                return flag;
            }else{
                this.each(function(key,ele){
                    //1.获取元素中class保存的值 并加上空格
                    var className = " "+ele.className+" ";
                    //2.给指定字符串加上空格
                    name = " "+name+" ";
                    //3.通过indexOf判断是否包含指定字符串
                    if(className.indexOf(name)!=-1){
                        //indexOf判断会判断到aabb中的bb这种情况，因此需要加空格
                        flag = true;   //如果在这里直接返回true代表each继续循环，所以需要用flag
                        return false;
                    }
                })
                return flag;
            }
        },
        addClass:function(name){
            //1.对传入的类名切割
            var names = name.split(" ");
            //2.遍历取出所有元素
            this.each(function(key,ele){
                //3.遍历数组取出每一个元素
                $.each(names,function(k,value){
                    //4.判断指定元素是否包含指定类名
                    if(!$(ele).hasClass(value)){
                         ele.className = ele.className + " "+ value;
                    }
                });
            })
            return this;
        },
        removeClass:function(name){
            //没传参就删除指定元素所有class
            if(arguments.length === 0){
                this.each(function(key,ele){
                    ele.className = "";
                });
            }else{
                //1.对传入的类名切割
                var names = name.split(" ");
                //2.遍历取出所有的元素
                this.each(function(key,ele){
                    //3.遍历数组取出每一个类名
                    $.each(names,function(k,value){
                        //4.判断指定元素中是否包含指定的类名
                        if($(ele).hasClass(value)){
                            //同理加空格匹配                          将其中的value替换为空
                            ele.className = (" "+ele.className+" ").replace(" "+value+" ","");
                        }
                    })
                })
            }
            return this;
        },
        toggleClass:function(name){
            if(arguments.length === 0 ){
                this.removeClass();
            }else{
                //1.对传入的类名切割
            var names = name.split(" ");
            //2.遍历取出所有的元素
            this.each(function(key,ele){
                //3.遍历数组取出每一个类名
                $.each(names,function(k,value){
                    //4.判断指定元素中是否包含指定的类名
                    if($(ele).hasClass(value)){
                        //删除
                        $(ele).removeClass(value);
                    }else{
                        //添加
                        $(ele).addClass(value);
                    }
                })
            })
            }
            return this;
        }
    })

    //事件相关方法：
    dQuery.prototype.extend({
        //on方法需要注意 如果只用数组存储起来而不区分事件类型，那么数组中存储的就全是第一个事件的类型了
        //例如click mouseover  ...  后续事件类型都会变成click，因此需要分类
        on:function(name,callBack){
            //1.遍历取出所有元素
            this.each(function(key,ele){
                //2.判断当前元素中是否有保存所有事件的对象
                if(!ele.eventsCache){
                    ele.eventsCache = {}; //定义一个空对象eventsCache用于装载指定元素的事件
                }
                //3.判断对象中有没有对应类型的数组  例如click
                if(!ele.eventsCache[name]){
                    ele.eventsCache[name] = [];   //在该对象中定义一个名为name的数组装载相同类型的事件
                    //4.将回调函数添加到数据中
                    ele.eventsCache[name].push(callBack);
                    //5.添加对应类型的事件
                    dQuery.addEvent(ele,name,function(){
                        //遍历添加数组中存储的事件
                        dQuery.each(ele.eventsCache[name],function(k,method){
                            method();
                        })
                    });
                }else{
                    //6.将回调函数添加到数据中
                    ele.eventsCache[name].push(callBack);  //若有对应类型的事件，则直接添加
                }
                
            })
        },
        off:function(name,callBack){
            //1.判断有没有传入参数
            if(arguments.length === 0){
                this.each(function(key,ele){
                    ele.eventsCache = {};
                });
            }
            //2.判断是否传入了一个参数
            else if(arguments.length === 1){
                this.each(function(key,ele){
                    ele.eventsCache[name] = []; //删除对应类型所有事件
                });
            }
            //3.判断是否传入两个参数
            else if(arguments === 2){
                this.each(function(key,ele){
                    dQuery.each(ele.eventsCache[name],function(index,method){
                          //判断当前遍历到的方法和传入的方法是否相同
                          if(method === callBack){
                              ele.eventsCache[name].splice(index,1); //移除对应类型对应事件
                          }
                    })
                })
            }
        }
    })


    //将init方法原型指向dQuery
    dQuery.prototype.init.prototype = dQuery.prototype;
    //定义全局变量dQuery 和 $，就可以使用$()的方式调用该js库
    window.dQuery = window.$ = dQuery;
})(window);