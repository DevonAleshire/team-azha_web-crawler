import Component from '@ember/component';
import { inject as service } from '@ember/service';
import $ from 'jquery';

export default Component.extend({

    init() {
        this._super(...arguments);
        this.set('url', 'https://');
        $('#bfs-radio').show();
    },

    store: service(),
    router: service(),

    searchMethod: 'bfs', //default to breadth first search

    actions: {
        submitForm(){
            let searchRequest = this.store.createRecord('search-request', {
                url: this.get('url'),
                searchMethod: this.searchMethod,
                depth: this.get('depth'),
                keyword: this.get('keyword'),
            });

            searchRequest.save();
            // eslint-disable-next-line no-console
            console.log(searchRequest.id);

            this.set('url', 'https://');
            this.set('depth', '');
            this.set('keyword', '');

            this.get('router').transitionTo('/dashboard/search/' + searchRequest.id);
        },
        methodChanged(value){
            if (value === 'dfs') {
                $('#dfs-radio').show();
                $('#bfs-radio').hide();
                $('#search-depth').attr({"max": "10"});
            } else {
                $('#bfs-radio').show();
                $('#dfs-radio').hide();
                $('#search-depth').attr({"max": "3"});
            }
            this.set('searchMethod', value);
        },
        clearForm() {
            this.set('url', 'https://');
            this.set('depth', '');
            this.set('keyword', '');
        }
    }
});
