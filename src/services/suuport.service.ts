import supportModel from '@models/support.model';

class SupportService {
  private support = supportModel;

  public addToSupport = ({ id, code }: { id: number; code: number }) => this.support.create({ id, code });
}

export default SupportService;
