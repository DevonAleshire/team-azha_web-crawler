import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import $ from 'jquery'

export default Route.extend({

    beforeModel(){
        $('.show-loading').show();
    },

    model(params){
        const formParams = this.store.findRecord('search-request', params.id);

          //make call to backend here
          const makeApiCall = (formData) => {
            console.log('formdata apicall', formData);

            const apiUrl = '/api/search/?' +
                        `url=${formData.url}` +
                        `&searchMethod=${formData.searchMethod}` +
                        `&depth=${formData.depth}` +
                        `&keyword=${formData.keyword}`;

             return fetch(apiUrl)
                .then((data) => {
                    console.log(data);
                    return data.json()
                }); 
        };
        const returnData = formParams.then(record => record.data)
                  .then((data) => makeApiCall(data)); 

        return RSVP.hash({
            data: returnData,
        });
    },

    afterModel(){
        $('.show-loading').hide();
    }


});