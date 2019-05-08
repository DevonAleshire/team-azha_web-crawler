import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({

    store: service(),
    router: service(),

    searchMethod: 'bfs', //default to breadth first search


    actions: {
        submitForm(){

            //some sort of validation

            let searchRequest = this.store.createRecord('search-request', {
                url: this.get('url'),
                searchMethod: this.searchMethod,
                depth: this.get('depth'),
                keyword: this.get('keyword')
            });

            searchRequest.save();
            console.log(searchRequest.id);

            this.set('url', '');
            this.set('searchMethod', 'bfs');
            this.set('depth', '');
            this.set('keyword', '');

            this.get('router').transitionTo('/dashboard/search/' + searchRequest.id);
        },

        //To Do: Data down, actions up 
        //https://dockyard.com/blog/2015/10/14/best-practices-data-down-actions-up 

        methodChanged(value){
            this.set('searchMethod', value);
        }
    }
});
