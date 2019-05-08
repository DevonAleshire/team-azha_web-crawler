import Route from '@ember/routing/route';

export default Route.extend({
    model(params){
        const formParams = this.store.findRecord('search-request', params.id)

        formParams.then(record => record.data)
                  .then((data) => makeApiCall(data)); 

        const makeApiCall = (formData) => {
            console.log('formdata apicall', formData);
        };
    }


});
