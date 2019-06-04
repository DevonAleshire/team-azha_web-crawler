import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import $ from 'jquery'


export default Route.extend({
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

            //Start Time
            var t0 = performance.now();
             return fetch(apiUrl)
                .then(res => res.json())
                .then((data) => {
                    //Finish Time
                    var t1 = performance.now();
                    console.log(formData.searchMethod, ' took ', (t1-t0), ' milliseconds')
                    console.log('Data: ', data)
                    console.table(data.nodes);
                    console.table(data.links)
                    return data
                }).catch((e) => console.log('Failed to retreive data from BE: ', e)); 
        };
        const returnData = formParams.then(record => record.data)
                  .then((data) => makeApiCall(data)); 

        return RSVP.hash({
            data: returnData,
        });
    },
});
