# frozen_string_literal: true

module Ocean
  class API
    attr_reader :client

    def initialize
      @client = Client.new
    end

    def orders(access_token, market: nil, state: nil, limit: 500, offset: nil)
      path = '/orders'
      authorization = format('Bearer %<access_token>s', access_token: access_token)
      client.get(
        path,
        headers: {
          Authorization: authorization
        },
        params: {
          market: market,
          state: state,
          limit: limit,
          offset: offset
        }
      )
    end

    def order(access_token, id)
      path = format('/orders/%<id>s', id: id)
      authorization = format('Bearer %<access_token>s', access_token: access_token)
      client.get(
        path,
        headers: {
          Authorization: authorization
        }
      )
    end

    def trades(market, order: 'ASC', limit: 100, offset: nil)
      offset ||= '2021-01-01T00:00:00Z'
      path = format('/markets/%<market>s/trades', market: market)
      client.get(
        path,
        params: {
          order: order,
          limit: limit,
          offset: offset
        }
      )
    end

    def book(market)
      path = format('/markets/%<market>s/book', market: market)
      client.get path
    end
  end
end
