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

        methodChanged(value){
            this.set('searchMethod', value);
        }
    }
});
