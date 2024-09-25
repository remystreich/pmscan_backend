import { Controller, Get } from '@nestjs/common';
import { Client } from 'pg';
import Redis from 'ioredis';

@Controller()
export class AppController {
  @Get()
  async getHello(): Promise<string> {
    const postgresStatus = await this.checkPostgres();
    const redisStatus = await this.checkRedis();

    return `Hello World!<br> PostgreSQL: ${postgresStatus} <br> Redis: ${redisStatus}`;
  }

  // Méthode pour vérifier la connexion PostgreSQL
  async checkPostgres(): Promise<string> {
    const client = new Client({
      host: 'postgres',
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      port: 5432,
    });

    try {
      await client.connect();
      await client.query('SELECT NOW()');
      await client.end();
      console.log('Connecté avec succès à PostgreSQL');
      return 'Connecté avec succès à PostgreSQL';
    } catch (error) {
      console.error('Erreur de connexion à PostgreSQL:', error);
      return 'Échec de connexion à PostgreSQL';
    }
  }

  // Méthode pour vérifier la connexion Redis
  async checkRedis(): Promise<string> {
    const redis = new Redis({
      host: 'redis',
      port: 6379,
    });

    try {
      await redis.set('test', 'value');
      const value = await redis.get('test');
      await redis.quit();
      if (value === 'value') {
        return 'Connecté avec succès à Redis';
      } else {
        return 'Échec de la lecture/écriture Redis';
      }
    } catch (error) {
      console.error('Erreur de connexion à Redis:', error);
      return 'Échec de connexion à Redis';
    }
  }
}
