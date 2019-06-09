import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

    store: service(),
    router: service(),

    actions: {
        deleteSearch(searchId){
            this.store.findRecord('search-request', searchId)
                .then(searchItem => searchItem.destroyRecord());
        },
    
        repeatSearch(searchId) {
            this.get('router').transitionTo('/search/' + searchId);
        }
    }
});
