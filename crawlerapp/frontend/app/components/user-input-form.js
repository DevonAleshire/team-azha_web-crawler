import Component from '@ember/component';

export default Component.extend({

    searchMethod: 'bfs',

    actions: {
        submitForm(url, depth, keyword){

            const formValues = {
                'URL': url,
                'Search Method': this.searchMethod,
                'Search Depth': depth,
                'Search Keyword': keyword
            }
            console.log("form submitted with: ", formValues);
        },

        methodChanged(value){
            this.set('searchMethod', value);
        }
    }
   
});
