// Box2D Physics Container
// Scott Cummings, 2013
// 

/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var SCBox2dLayer = cc.Layer.extend({
	ctor:function () {
		this._super();
        this.gameConfig = new SCGameConfig();        
    },
    
    initWithMap:function(map){
        var b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2World = Box2D.Dynamics.b2World
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
            , b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

        var screenSize = cc.Director.getInstance().getWinSize();

        // Construct a world object, which will hold and simulate the rigid bodies.
        this.world = new b2World(new b2Vec2(this.gameConfig.Box2dLayer.gravityX, this.gameConfig.Box2dLayer.gravityY), true);
        this.world.SetContinuousPhysics(true);


        // listen for beginning of all body collisions
        var listener = new Box2D.Dynamics.b2ContactListener;
        listener.BeginContact = function(contact) {
         	cc.log("BOX2D Collision Contact Listener = ");
         	cc.log(contact.GetFixtureA().GetBody().GetUserData());
         }
         this.world.SetContactListener(listener);
       
        // take tile map and make physics shapes.
        this.makeTiles(map, true, cc.p(-100,-110), cc.p(30,20));
       


        
        // this is the test graphic for 
        var mgr = cc.SpriteBatchNode.create(s_pathBlock, 150);
        this.addChild(mgr, 0, TAG_SPRITE_MANAGER);

        //Set up sprite for testing adding a sprite attached to a BOX2D shape (square for now)
        this.addNewSpriteWithCoords(cc.p(screenSize.width / 2, screenSize.height / 2));
        
        
        // add a physics debug draw visualization in a seperate canvas
        if(this.gameConfig.Box2dLayer.debugDraw == true){
        	// attempt to draw debug using another canvas
        	var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite(document.getElementById("boxCanvas").getContext("2d"));
			debugDraw.SetDrawScale(this.gameConfig.Box2dLayer.PTM_RATIO);
			debugDraw.SetFillAlpha(0.5);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			this.world.SetDebugDraw(debugDraw);
		}
			
			
			
		/* //currently doesn't work on cc2d HTML5 2.1. To reactivate also have to override draw() function and include this.world.DrawDebugData();
		// Also, could try transforming this layer to see if it changes the view
		// attempt to draw debug using Cocos2D
		//set up debug draw
        var debugDraw = new b2DebugDraw();
        debugDraw.SetSprite(cc.renderContext);
        debugDraw.SetDrawScale(this.gameConfig.Box2dLayer.PTM_RATIO);
        debugDraw.SetFillAlpha(0.3);
        debugDraw.SetLineThickness(1.0);
        debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit | b2DebugDraw.e_centerOfMassBit);
        this.world.SetDebugDraw(debugDraw);
        */

        //this.scheduleUpdate();
   
        
        cc.log("Box2DTest Finished CTOR");

    },
    
    
    // Create rigid bodies from tile map.
    // If joinX or Y are true, ake longer shapes on when consecutive tiles are solid.
    //
    //		Might need to reverse #'s for Y since tileMaps have Y inverted (y=0 is top of map)
    makeTiles:function(map, joinX, bottomLeft, topRight){
	    var b2Vec2 = Box2D.Common.Math.b2Vec2
            , b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2World = Box2D.Dynamics.b2World
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
            , b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
	        	 	
        	
        // Start creating the tile world rigid bodies
        var fixDef = new b2FixtureDef;
        fixDef.density = this.gameConfig.Box2dLayer.tileBox.density;
        fixDef.friction = this.gameConfig.Box2dLayer.tileBox.friction;
        fixDef.restitution = this.gameConfig.Box2dLayer.tileBox.restitution;

        var bodyDef = new b2BodyDef;

        //create standard tile body
        bodyDef.type = b2Body.b2_staticBody;
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(this.gameConfig.Box2dLayer.tileBox.diameter, this.gameConfig.Box2dLayer.tileBox.center);


        // check draw area for being within the tile map
        if(bottomLeft.x<0){
	        bottomLeft.x = 0;
        }
        if(topRight.y>map.getMapSize().height){
        	//cc.log("SCBox2DLayer makeTiles topRight.y > map");
	        topRight.y = map.getMapSize().height;
	        //cc.log("SCBox2DLayer makeTiles topRight.y = " + topRight.y);
        }
        if(topRight.x>map.getMapSize().width){
        	//cc.log("SCBox2DLayer makeTiles topRight.x > map");
	        topRight.x = map.getMapSize().width;
	        //cc.log("SCBox2DLayer makeTiles topRight.x = " + topRight.x);
        }
        if(bottomLeft.y<0){
	        bottomLeft.y = 0;
        }
        
        
        // i=y, j=x. Might need to reverse #'s for Y since tileMaps have Y inverted (y=0 is top of map)
	     for(var i=bottomLeft.y; i<topRight.y; i++){
	        for(var j=bottomLeft.x; j<topRight.x; j++){
		       // if there is no tile or no proper tile properties, there will be errors unless you run checks first.
		       var tileProps = map.getTileProperties("physics", cc.p(j,i));
		       if(tileProps){
			       if(tileProps.physics && tileProps.physics == "solid"){
			       	fixDef.shape.SetAsBox(this.gameConfig.Box2dLayer.tileBox.diameter, this.gameConfig.Box2dLayer.tileBox.center);
			       	var pos = cc.p(j, i);
			       	// join consecutive horizontal tiles if desired
			       	if(joinX == true){
			       		j++;
			       		var shapeWidth = this.gameConfig.Box2dLayer.tileBox.diameter;
			       		while(j<topRight.x){
				       		tileProps = map.getTileProperties("physics", cc.p(j,i));
				       		if(tileProps && tileProps.physics && tileProps.physics == "solid"){
				       			shapeWidth += this.gameConfig.Box2dLayer.tileBox.diameter;
					       		fixDef.shape.SetAsBox(shapeWidth, this.gameConfig.Box2dLayer.tileBox.center);
					       		pos = cc.p(pos.x + this.gameConfig.Box2dLayer.tileBox.center, pos.y);
					       	}else{
					       		break;
					       	}
				       		j++;
				       	}
			       	}
			       	// Attach body to world
			       	bodyDef.position.Set(pos.x + this.gameConfig.Box2dLayer.tileBox.center, pos.y + this.gameConfig.Box2dLayer.tileBox.center);
				   	this.world.CreateBody(bodyDef).CreateFixture(fixDef);    
			       }
			       
		       }
	        }
        }
	    
    },

    addNewSpriteWithCoords:function (p) {
        //UXLog(L"Add sprite %0.2f x %02.f",p.x,p.y);
        var batch = this.getChildByTag(TAG_SPRITE_MANAGER);
        // correct for world movement
        p.x = p.x - this.getPosition().x;
        p.y = p.y - this.getPosition().y;
        cc.log("addNewSpriteWithCoords:function (p) p.x/y = " + p.x + " " + p.y);
        //We have a 64x64 sprite sheet with 4 different 32x32 images.  The following code is
        //just randomly picking one of the images
        var idx = (Math.random() > .5 ? 0 : 1);
        var idy = (Math.random() > .5 ? 0 : 1);
        var sprite = cc.Sprite.createWithTexture(batch.getTexture(), cc.rect(32 * idx, 32 * idy, 32, 32));
        // scott, trying to add a name fo ID
        sprite.SCName = "testName from Scott";
        batch.addChild(sprite);

        sprite.setPosition(cc.p(p.x, p.y));

        // Define the dynamic body.
        //Set up a 1m squared box in the physics world
        var b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(p.x / this.gameConfig.Box2dLayer.PTM_RATIO, p.y / this.gameConfig.Box2dLayer.PTM_RATIO);
        bodyDef.userData = sprite;
        var body = this.world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(0.5, 0.5);//These are mid points for our 1m box

        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.3;
        body.CreateFixture(fixtureDef);

    },
    
        addNewEntity:function (p, newEntity) {
        //UXLog(L"Add sprite %0.2f x %02.f",p.x,p.y);
        //var batch = this.getChildByTag(TAG_SPRITE_MANAGER);
        // correct for world movement
        p.x = p.x - this.getPosition().x;
        p.y = p.y - this.getPosition().y;
        //cc.log("addNewSpriteWithCoordsNew:function (p) p.x/y = " + p.x + " " + p.y);
        //We have a 64x64 sprite sheet with 4 different 32x32 images.  The following code is
        //just randomly picking one of the images
        //var idx = (Math.random() > .5 ? 0 : 1);
        //var idy = (Math.random() > .5 ? 0 : 1);
        //var sprite = cc.Sprite.createWithTexture(batch.getTexture(), cc.rect(32 * idx, 32 * idy, 32, 32));
        // scott, trying to add a name fo ID
        //sprite.SCName = "testName from Scott";
        //batch.addChild(sprite);

        newEntity.setPosition(cc.p(p.x, p.y));
        this.addChild(newEntity, 100, newEntity.getID());

        // Define the dynamic body.
        //Set up a 1m squared box in the physics world
        var b2BodyDef = Box2D.Dynamics.b2BodyDef
            , b2Body = Box2D.Dynamics.b2Body
            , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
            , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;

        var bodyDef = new b2BodyDef();
        bodyDef.type = b2Body.b2_dynamicBody;
        bodyDef.position.Set(p.x / this.gameConfig.Box2dLayer.PTM_RATIO, p.y / this.gameConfig.Box2dLayer.PTM_RATIO);
        bodyDef.userData = newEntity;
        var body = this.world.CreateBody(bodyDef);

        // Define another box shape for our dynamic body.
        var dynamicBox = new b2PolygonShape();
        dynamicBox.SetAsBox(0.5, 0.5);//These are mid points for our 1m box

        // Define the dynamic body fixture.
        var fixtureDef = new b2FixtureDef();
        fixtureDef.shape = dynamicBox;
        fixtureDef.density = 1.0;
        fixtureDef.friction = 0.3;
        body.CreateFixture(fixtureDef);

    },
    
     getPhysicsUpdateWindow:function(worldPosition, tileMap){
	    cc.log("SCBox2DLayer getPhysicsUpdateWindow()");
	    cc.log("SCBox2DLayer getPhysicsUpdateWindow() worldPosition.x/y = " + worldPosition.x + " " + worldPosition.y);
	    /*
	    var touchLocation = touch.getLocation();
    	var tileMap = this.gameLayer.getChildByTag(this.gameConfig.globals.TAG_TILE_MAP);
    	var layer = tileMap.getLayer("foreground");
    	var tileSize = tileMap.getTileSize();
    	var mapSize = tileMap.getMapSize();
    	var mapLocation = tileMap.getPosition();
    	var mapTouchLocation = tileMap.convertTouchToNodeSpace(touch);
    	var tileTouchedX = Math.floor(mapTouchLocation.x / tileSize.width);
    	var tileTouchedY = Math.floor(mapSize.height - mapTouchLocation.y / tileSize.height); // Because Tiled maps register in the top left corner rather than bottom left
    	var tileCoord = cc.p(tileTouchedX, tileTouchedY);
    	var signProperties = tileMap.getPointProperties("signs", mapTouchLocation);
    	var customerProperties = tileMap.getPointProperties("customers", mapTouchLocation);

    	*/
    	
    	
    	var tileSize = tileMap.getTileSize();
    	var mapSizeTiles = tileMap.getMapSize();
    	var mapSizePoints = new Object();
    	mapSizePoints.width = mapSizeTiles.width * tileSize.width;
    	mapSizePoints.height = mapSizeTiles.height * tileSize.height;
    	var mapLocation = tileMap.getPosition();
    	var gameSize = cc.Director.getInstance().getWinSize();
    	cc.log("SCBox2DLayer getPhysicsUpdateWindow() mapSizePoints = " + mapSizePoints.width + " " + mapSizePoints.height);
    	
    	// World point is where on the screen we want the point to be
    	var topLeftWorldPoint = cc.p(0 - this.gameConfig.Box2dLayer.physicsWindowMargin.x, gameSize.height +  this.gameConfig.Box2dLayer.physicsWindowMargin.y);
    	var topLeftMapPoint = tileMap.convertToNodeSpace(topLeftWorldPoint);
    	var topLeftTilePoint = cc.p(Math.floor(topLeftMapPoint.x / tileSize.width), Math.floor(mapSizeTiles.height - topLeftMapPoint.y / tileSize.height));
    	var bottomLeftWorldPoint = cc.p(0 - this.gameConfig.Box2dLayer.physicsWindowMargin.x, 0 - this.gameConfig.Box2dLayer.physicsWindowMargin.y);
    	var bottomLeftMapPoint = tileMap.convertToNodeSpace(bottomLeftWorldPoint);
    	var bottomLeftTilePoint = cc.p(Math.floor(bottomLeftMapPoint.x / tileSize.width), Math.floor(mapSizeTiles.height - bottomLeftMapPoint.y / tileSize.height));
    	var topRightWorldPoint = cc.p(gameSize.width + this.gameConfig.Box2dLayer.physicsWindowMargin.x, gameSize.height + this.gameConfig.Box2dLayer.physicsWindowMargin.y);
    	var topRightMapPoint = tileMap.convertToNodeSpace(topRightWorldPoint);
    	var topRightTilePoint = cc.p(Math.floor(topRightMapPoint.x / tileSize.width), Math.floor(mapSizeTiles.height - topRightMapPoint.y / tileSize.height));
    	var bottomRightWorldPoint = cc.p(gameSize.width + this.gameConfig.Box2dLayer.physicsWindowMargin.x, 0 - this.gameConfig.Box2dLayer.physicsWindowMargin.y);
    	var bottomRightMapPoint = tileMap.convertToNodeSpace(bottomRightWorldPoint);
    	var bottomRightTilePoint = cc.p(Math.floor(bottomRightMapPoint.x / tileSize.width), Math.floor(mapSizeTiles.height - bottomRightMapPoint.y / tileSize.height));
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() topLeftWorldPoint.x/y = " + topLeftWorldPoint.x + " " + topLeftWorldPoint.y);
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() topLeftMapPoint.x/y = " + topLeftMapPoint.x + " " + topLeftMapPoint.y);
		cc.log("SCBox2DLayer getPhysicsUpdateWindow() topLeftTilePoint.x/y = " + topLeftTilePoint.x + " " + topLeftTilePoint.y);
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() bottomLeftWorldPoint.x/y = " + bottomLeftWorldPoint.x + " " + bottomLeftWorldPoint.y);
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() bottomLeftMapPoint.x/y = " + bottomLeftMapPoint.x + " " + bottomLeftMapPoint.y);
		cc.log("SCBox2DLayer getPhysicsUpdateWindow() bottomLeftTilePoint.x/y = " + bottomLeftTilePoint.x + " " + bottomLeftTilePoint.y);
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() topRightWorldPoint.x/y = " + topRightWorldPoint.x + " " + topRightWorldPoint.y);
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() topRightMapPoint.x/y = " + topRightMapPoint.x + " " + topRightMapPoint.y);
		cc.log("SCBox2DLayer getPhysicsUpdateWindow() topRightTilePoint.x/y = " + topRightTilePoint.x + " " + topRightTilePoint.y);
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() bottomRightWorldPoint.x/y = " + bottomRightWorldPoint.x + " " + bottomRightWorldPoint.y);
		//cc.log("SCBox2DLayer getPhysicsUpdateWindow() bottomRightMapPoint.x/y = " + bottomRightMapPoint.x + " " + bottomRightMapPoint.y);
		cc.log("SCBox2DLayer getPhysicsUpdateWindow() bottomRightTilePoint.x/y = " + bottomRightTilePoint.x + " " + bottomRightTilePoint.y);
		
		
	   	    
    },
    update:function (dt) {
        //It is recommended that a fixed time step is used with Box2D for stability
        //of the simulation, however, we are using a variable time step here.
        //You need to make an informed choice, the following URL is useful
        //http://gafferongames.com/game-physics/fix-your-timestep/
        
        var b2Vec2 = Box2D.Common.Math.b2Vec2;

        var velocityIterations = 8;
        var positionIterations = 1;

        // Instruct the world to perform a single step of simulation. It is
        // generally best to keep the time step and iterations fixed.
        this.world.Step(dt, velocityIterations, positionIterations);

        //Iterate over the bodies in the physics world
        for (var b = this.world.GetBodyList(); b; b = b.GetNext()) {
            if (b.GetUserData() != null) {
                //Synchronize the AtlasSprites position and rotation with the corresponding body
                var myActor = b.GetUserData();
                // if it is the player -- needs to be moved to player entity
                if(myActor.ID && myActor.ID == this.gameConfig.globals.TAG_PLAYER){
                	
                	b.SetAwake(true);
                	b.SetAngle(0);
                	b.SetAngularVelocity(0);
                	
                	if(myActor.state && myActor.state.movementDirection){
                		cc.log("SCBox2DLayer update() myActor.state.movementDirection = " + myActor.state.movementDirection);
                		if(myActor.state.movementDirection == "up"){
	                		cc.log("SCBox2DLayer update() myActor.state.movementDirection == \"up\"");
	                		var force = new b2Vec2(0,10);
	                		b.SetAwake(true);
	                		b.SetLinearVelocity(force);
	                	
	                	}
	                	if(myActor.state.movementDirection == "right"){
	                		cc.log("SCBox2DLayer update() myActor.state.movementDirection == \"right\"");
	                		var force = new b2Vec2(10,0);
	                		b.SetAwake(true);
	                		b.SetLinearVelocity(force);
	                	
	                	}
	                	if(myActor.state.movementDirection == "left"){
	                		cc.log("SCBox2DLayer update() myActor.state.movementDirection == \"left\"");
	                		var force = new b2Vec2(-10,0);
	                		b.SetAwake(true);
	                		b.SetLinearVelocity(force);
	                	
	                	}
	                	if(myActor.state.movementDirection == "down"){
	                		cc.log("SCBox2DLayer update() myActor.state.movementDirection == \"down\"");
	                		var force = new b2Vec2(0,-10);
	                		b.SetAwake(true);
	                		b.SetLinearVelocity(force);
	                	
	                	}
	                }
	             }
	            myActor.setPosition(cc.p(b.GetPosition().x * this.gameConfig.Box2dLayer.PTM_RATIO, b.GetPosition().y * this.gameConfig.Box2dLayer.PTM_RATIO));
                myActor.setRotation(-1 * cc.RADIANS_TO_DEGREES(b.GetAngle()));
            }
        }
        
        if(this.gameConfig.Box2dLayer.debugDraw == true){
         	this.world.DrawDebugData();
         }
         //this.setPosition(cc.p(this.getPosition().x + .3, this.getPosition().y + .3));
         //this.world.position.Set(2,2);

    }
    /* enable to draw physics shapes on CC2D Canvas. Doesn't work correctly in CC2D currently (cc2D HTML5 2.1)
    draw:function (ctx) {
    	this.world.DrawDebugData();
        this._super(ctx);
    },
    */
    
    

});