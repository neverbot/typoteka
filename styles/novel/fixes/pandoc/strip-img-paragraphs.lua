
-- to fix a weird bug with the example style in typoteka
-- some images are converted to html as <p><img ...></p>, and are 
-- rendered with empty space (generating an empty first page)
-- this filter removes such the paragraph tag when it only
-- contains a single image

function Para(el)
  if #el.c == 1 and el.c[1].t == "Image" then
    return el.c[1]
  end
end
