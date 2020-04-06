# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Home', type: :request do
  it 'should render hotel card' do
    get '/'
    expect(response).to render_template(:index)
    expect(response).to have_http_status(200)
    expect(response.body).to match /<h4>\W*Sura Design Hotel &amp; Suites/im
  end
end
