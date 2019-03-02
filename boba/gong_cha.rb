module Boba
  def self.gong_cha
    # Gong Cha
    @driver.navigate.to 'http://www.gong-cha-sg.com/stores/'

    wait = Selenium::WebDriver::Wait.new(timeout: 20) # seconds
    wait.until { @driver.find_element(css: '.item') }
    items = @driver.find_elements(css: '.item')
    
    items.map { |item_elem|
      BobaShop.new(
        item_elem.find_element(css: '.p-title').text,
        item_elem.find_element(css: '.p-area').text,
        nil,
        item_elem.find_element(css: '.p-time').text,
        'Gong Cha'
      )
      }.reject { |shop| shop.title.empty? }
  end
end
