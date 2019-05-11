import Controller from '@ember/controller';

export default Controller.extend({
    actions: {
        transitionInController(){
            this.transitionToRoute('dashboard');
        },

        deleteSearch(searchId){
            this.store.findRecord('search-request', searchId)
                .then(searchItem => searchItem.destroyRecord());
        },

        repeatSearch(searchId) {
            this.transitionToRoute('/dashboard/search/' + searchId);
        }
    }
});
