export default function(){
    this.transition(
      this.fromRoute('dashboard'),
      this.toRoute('loading'),
      this.use('toLeft'),
      this.reverse('toRight')
    );

    this.transition(
      this.fromRoute('search'),
      this.toRoute('dashboard'),
      this.use('toRight')
    );
}
