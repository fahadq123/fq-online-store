export class ProductObject{
    obj : object

    constructor (productObj : object){
        this.obj = productObj;

    }
    getObj() : object{
        return this.obj;
    }
}