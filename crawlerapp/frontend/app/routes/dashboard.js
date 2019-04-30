import Route from '@ember/routing/route';

export default Route.extend({
    model() {
        return {
            id: 1,
            url: 'google.com',
            searchMethod: 'dfs',
            depth: 15,
            keyword: 'testing'
        }
    }
});
