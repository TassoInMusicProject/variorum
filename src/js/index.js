import $ from 'jquery';
import Variorum from './routers/variorum.js';
import Backbone from 'backbone';

class Application {

    constructor () {
        let baseDir = 'data/Trm1049';

	    new Variorum(
	    	{"files" : [

			baseDir + 'E2.xml',
			baseDir + 'S141.xml',
			baseDir + 'S166.xml',
			baseDir + 'S169.xml',
			baseDir + 'S28.xml',
			baseDir + 'Trm1049a-Basso.xml',
			baseDir + 'Trm1049a-Canto.xml',
			baseDir + 'Trm1049a-Tenore.xml',
			baseDir + 'Trm1049b-Basso.xml',
			baseDir + 'Trm1049b-Canto.xml'
		],
	    	"collation" : baseDir+'collation.xml'
		}
	    );

//	    new Variorum(
//	    	{"files" : [
//			baseDir+'E2.xml', 
//			baseDir+'E3.xml', 
//			baseDir+'S71.xml', 
//			baseDir+'Trm0319a-Canto.xml', 
//			baseDir+'Trm0319a-Basso.xml'
//		],
//	    	"collation" : baseDir+'collation.xml'
//		}
//	    );

    }


}

$(() => {
    new Application();
});




