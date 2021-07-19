import * as THREE from 'three'

export class Light extends THREE.Light{
    
    constructor( type: string , decay: number, color: number){
        super();
        // console.log(`%c ${type}` , "border:1px red solid; padding 10px;")
        if(type == "direct"){
            const selectType = new THREE.DirectionalLight(color, decay)
            selectType.castShadow = true;
            this.add(selectType)
        }else if(type == "spot"){
            const selectType = new THREE.SpotLight(color, decay, 10, 45, 1, 0.5 )
            
            selectType.shadow.mapSize.width = 512;  // default
            selectType.shadow.mapSize.height = 512; // default
            selectType.shadow.camera.near = 0.5;       // default
            selectType.shadow.camera.far = 500      // default
            // selectType.castShadow = true;            // default false
            selectType.castShadow = true;
            this.add(selectType)
        }
        
    }   
}