-- Fix problematic HTML structures that cause PagedJS infinite loops
-- and normalise chapter blocks so HTML outputs section.chapter (like test-minimal)
-- instead of div.chapter, so PagedJS paginates correctly.

function Div(div)
    -- Replace TOC chapter (## CONTENTS + table of links) with empty #contents placeholder
    -- so the HTML has <div id="contents"></div> like test-minimal; create-toc.js then
    -- fills it with one <ul>, avoiding one table row per page.
    if div.classes:includes("chapter") then
        local content = div.content
        if #content >= 1 then
            local first = content[1]
            if first.t == "Header" and first.level == 2 then
                local text = pandoc.utils.stringify(first.content):gsub("^%s+", ""):gsub("%s+$", "")
                if text == "CONTENTS" then
                    return { pandoc.Div(pandoc.Blocks{}, pandoc.Attr("contents", {}, {})) }
                end
            end
        end
    end

    -- Unwrap Div.chapter: replace with its contents so the HTML writer produces
    -- sections (from the inner Header) instead of <div class="chapter">.
    -- Add class "chapter" to the first block so the section gets .chapter.
    if div.classes:includes("chapter") then
        local content = div.content
        if #content > 0 then
            local first = content[1]
            if first.t == "Header" and first.attr then
                if not first.attr.classes:includes("chapter") then
                    first.attr.classes:insert("chapter")
                end
            elseif first.t == "Div" and first.attr and first.identifier == "" then
                -- First block might be a Div (e.g. containing section); add class to it
                if not first.attr.classes:includes("chapter") then
                    first.attr.classes:insert("chapter")
                end
            end
        end
        return content
    end

    -- If this is a chapter div with a very long ID (when not unwrapped), simplify
    if div.classes:includes("chapter") and div.identifier and string.len(div.identifier) > 50 then
        local short_id = div.identifier:match("([^_]+)$") or "chapter"
        div.identifier = short_id
    end

    -- For any div with problematic pgepubid naming, simplify
    if div.identifier and div.identifier:find("pgepubid") then
        local number = div.identifier:match("pgepubid(%d+)")
        if number then
            div.identifier = "section" .. number
        else
            div.identifier = "section"
        end
    end

    return div
end

function Header(header)
    -- If header contains problematic span elements, clean them up
    local cleaned_content = {}
    
    for i, inline in ipairs(header.content) do
        if inline.t == "Span" then
            -- Check if this is an empty span with a very long ID (anchor span)
            if #inline.content == 0 and inline.identifier and string.len(inline.identifier) > 30 then
                -- Skip this problematic span completely - don't add to cleaned_content
            elseif inline.identifier and string.len(inline.identifier) > 30 then
                -- If span has content but problematic ID, keep content but remove ID
                inline.identifier = ""
                table.insert(cleaned_content, inline)
            else
                -- Keep normal spans
                table.insert(cleaned_content, inline)
            end
        else
            -- Keep all non-span content
            table.insert(cleaned_content, inline)
        end
    end
    
    header.content = cleaned_content
    return header
end

function Span(span)
    -- Remove empty spans with very long IDs that are causing pagination issues
    if #span.content == 0 and span.identifier and string.len(span.identifier) > 30 then
        -- These are problematic anchor spans - remove them completely
        -- by returning an empty list (nil removes the span)
        return {}
    end
    
    -- For spans with very long IDs that have content, shorten the ID
    if span.identifier and string.len(span.identifier) > 30 then
        -- Extract just the meaningful part of the ID (usually after the last underscore)
        local short_id = span.identifier:match("([^_]+)$") or span.identifier:sub(-10)
        span.identifier = short_id
    end
    
    return span
end

-- Also handle problematic section structures
function Section(section)
    if section.identifier and string.len(section.identifier) > 50 then
        -- Shorten very long section IDs
        local short_id = section.identifier:match("([^_]+)$") or section.identifier:sub(-15)
        section.identifier = short_id
    end
    
    -- Specifically handle pgepubid identifiers  
    if section.identifier and section.identifier:find("pgepubid") then
        local number = section.identifier:match("pgepubid(%d+)")
        if number then
            section.identifier = "section" .. number
        else
            section.identifier = "section"
        end
    end
    
    return section
end
