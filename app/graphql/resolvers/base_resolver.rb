# frozen_string_literal: true

module Resolvers
  class BaseResolver < GraphQL::Schema::Resolver
    def current_user
      context[:current_user]
    end

    def current_conversation
      MixinConversation.find_by conversation_id: context[:current_conversation_id]
    end
  end
end
