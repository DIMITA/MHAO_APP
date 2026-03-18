import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Controller()
export class QuotesController {
  private readonly logger = new Logger(QuotesController.name);

  constructor(private readonly quotesService: QuotesService) {}

  @MessagePattern('quotes.create')
  async create(
    @Payload()
    payload: { providerId: string; profileId: string; dto: CreateQuoteDto },
  ) {
    this.logger.log(`quotes.create called for provider: ${payload.providerId}`);
    return this.quotesService.create(
      payload.providerId,
      payload.profileId,
      payload.dto,
    );
  }

  @MessagePattern('quotes.find_one')
  async findOne(@Payload() payload: { id: string }) {
    this.logger.log(`quotes.find_one called for id: ${payload.id}`);
    return this.quotesService.findOne(payload.id);
  }

  @MessagePattern('quotes.find_by_project')
  async findByProject(@Payload() payload: { projectId: string }) {
    this.logger.log(
      `quotes.find_by_project called for project: ${payload.projectId}`,
    );
    return this.quotesService.findByProject(payload.projectId);
  }

  @MessagePattern('quotes.accept')
  async accept(@Payload() payload: { id: string; clientId: string }) {
    this.logger.log(`quotes.accept called for id: ${payload.id}`);
    return this.quotesService.accept(payload.id, payload.clientId);
  }

  @MessagePattern('quotes.reject')
  async reject(@Payload() payload: { id: string; clientId: string }) {
    this.logger.log(`quotes.reject called for id: ${payload.id}`);
    return this.quotesService.reject(payload.id, payload.clientId);
  }

  @MessagePattern('quotes.my_quotes')
  async getMyQuotes(@Payload() payload: { providerId: string }) {
    this.logger.log(
      `quotes.my_quotes called for provider: ${payload.providerId}`,
    );
    return this.quotesService.getMyQuotes(payload.providerId);
  }

  @MessagePattern('quotes.withdraw')
  async withdraw(@Payload() payload: { id: string; providerId: string }) {
    this.logger.log(`quotes.withdraw called for id: ${payload.id}`);
    return this.quotesService.withdraw(payload.id, payload.providerId);
  }
}
