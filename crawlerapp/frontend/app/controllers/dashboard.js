import Controller from '@ember/controller';

export default Controller.extend({
    actions: {
        transitionInController(){
            this.transitionToRoute('dashboard');
        }
    }
});
