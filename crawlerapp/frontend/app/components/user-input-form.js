import Component from '@ember/component';

export default Component.extend({

    searchMethod: 'bfs', //default to breadth first search


    actions: {
        submitForm(){
            const formValues = {
                'URL': this.get('url'),
                'Search Method': this.searchMethod,
                'Search Depth': this.get('depth'),
                'Search Keyword': this.get('keyword')
            };
            console.log("form submitted with: ", formValues);
        },

        //To Do: Data down, actions up 
        //https://dockyard.com/blog/2015/10/14/best-practices-data-down-actions-up 

        methodChanged(value){
            this.set('searchMethod', value);
        }
    }
});
